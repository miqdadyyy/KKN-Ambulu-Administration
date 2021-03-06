import axios from 'axios';
// const API_URL = process.env.API_URL || 'https://glacial-beach-80244.herokuapp.com';
const API_URL = process.env.API_URL || 'http://localhost:3000';

import authHeader from "@/services/auth-header";

class AuthService {
  static login(username, password){
    return axios
      .post(`${API_URL}/auth/login`, {
        username: username,
        password: password
      })
      .then(response => {
        if(response.data.statusCode === 200){
          localStorage.setItem('user', JSON.stringify(response.data.data));
        }
        return response.data;
      })
  }
  
  static check(){
    return axios
      .get(`${API_URL}/auth/check`, {
        headers: authHeader()
      })
      .then((response) => {
        return response.statusCode === 200;
      });
  }
  
  static logout(){
    localStorage.removeItem('user');
  }
}

export default AuthService;
