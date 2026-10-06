import { HttpClient, HttpHandler, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

export enum AttendanceStatus {
    PRESENT = 'PRESENT',
    ABSENT = 'ABSENT',
    ON_LEAVE = 'ON_LEAVE',
    HOLIDAY = 'HOLIDAY'
}

@Injectable({
    providedIn:'root'
})

export class AttendanceService{
    private http=inject(HttpClient)
    private apiUrl='http://localhost:8081/api/v1/employee/attendance'

    private getAuthHeader():HttpHeaders{
        const token=localStorage.getItem('token')||'';
        return new HttpHeaders({
            Authorization:'Bearer '+token,
            'Content-Type':'application/json'
        })
    }

    getalldata():Observable<any>{
        return this.http.get(`${this.apiUrl}/all`,{headers:this.getAuthHeader()})
    }

    getfilterdata(date: string, status: AttendanceStatus | string):Observable<any>{
        return this.http.get(`${this.apiUrl}/get-by-status-and-date/${date}/${status}`,{headers:this.getAuthHeader()})
    }

}