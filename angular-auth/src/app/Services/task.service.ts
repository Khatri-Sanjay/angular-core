import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams, HttpEventType } from '@angular/common/http';
import { Task } from "../Model/Task";
import { map, catchError, tap } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';
import { LoggingService } from "./logging.Service";
import {AuthService} from "./auth.service";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class TaskService{

    static API = environment.baseUrl;

    protected getApi() {
        return TaskService.API;
    }

    http: HttpClient = inject(HttpClient);
    loggingService: LoggingService = inject(LoggingService);
    authService: AuthService = inject(AuthService);
    errorSubject = new Subject<HttpErrorResponse>();

    CreateTask(task: Task){
        const headers = new HttpHeaders({'my-header': 'hello-world'})
        this.http.post<{name: string}>(
            this.getApi() + '/tasks.json',
            task, {headers: headers}
            )
            .pipe(catchError((err) => {
                //Write the logic to log errors
                const errorObj = {statusCode: err.status, errorMessage: err.message, datetime: new Date()}
                this.loggingService.logError(errorObj);
                return throwError(() => err);
            }))
            .subscribe({error: (err) => {
                this.errorSubject.next(err);
            }});
    }

    DeleteTask(id: string | undefined){
        this.http.delete(this.getApi() + '/tasks/' +id+'.json')
        .pipe(catchError((err) => {
            //Write the logic to log errors
            const errorObj = {statusCode: err.status, errorMessage: err.message, datetime: new Date()}
            this.loggingService.logError(errorObj);
            return throwError(() => err);
        }))
        .subscribe({error: (err) => {
            this.errorSubject.next(err);
        }});
    }

    DeleteAllTasks(){
        this.http.delete(this.getApi() + '/tasks.json', {observe: 'events', responseType: 'json'})
        .pipe(tap((event) => {
            console.log(event);
            if(event.type === HttpEventType.Sent){

            }
        }), catchError((err) => {
            //Write the logic to log errors
            const errorObj = {statusCode: err.status, errorMessage: err.message, datetime: new Date()}
            this.loggingService.logError(errorObj);
            return throwError(() => err);
        }))
        .subscribe({error: (err) => {
            this.errorSubject.next(err);
        }})
    }

    GetAllTasks(){
        let headers = new HttpHeaders();
        headers = headers.append('content-type', 'application/json');
        headers = headers.append('content-type', 'text/html')

        let queryParams = new HttpParams();
        queryParams = queryParams.set('page', 2);
        queryParams = queryParams.set('item', 10)

        return this.http.get<{[key: string]: Task}>(
            this.getApi() + '/tasks.json'
            ,{headers: headers, params: queryParams, observe: 'body'}
            ).pipe(map((response) => {
                 //TRANSFORM DATA
                 let tasks = [];
                 console.log(response);
                 for(let key in response){
                   if(response.hasOwnProperty(key)){
                     tasks.push({...response[key], id: key});
                   }
                 }

                 return tasks;
            }), catchError((err) => {
                //Write the logic to log errors
                const errorObj = {statusCode: err.status, errorMessage: err.message, datetime: new Date()}
                this.loggingService.logError(errorObj);
                return throwError(() => err);
            }))
    }

    UpdateTask(id: string | undefined, data: Task){
        this.http.put(this.getApi() + '/tasks/'+id+'.json', data)
        .pipe(catchError((err) => {
            //Write the logic to log errors
            const errorObj = {statusCode: err.status, errorMessage: err.message, datetime: new Date()}
            this.loggingService.logError(errorObj);
            return throwError(() => err);
        }))
        .subscribe({error: (err) => {
            this.errorSubject.next(err);
        }});
    }

    getTaskDetails(id: string | undefined){
        return this.http.get(this.getApi() + '/tasks/'+id+'.json')
        .pipe(map((response) => {
            console.log(response)
            let task = {};
            task = {...response, id: id}
            return task;
        }))
    }
}
