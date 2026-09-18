import {createContext,useContext,useEffect,useMemo,useState} from 'react';
import type {PropsWithChildren} from 'react';
import {authApi} from './authApi';
import type {User} from './authApi';

type AuthContextValue={
  user:User|null;
  loading:boolean;
  login:(username:string,password:string,remember:boolean)=>Promise<void>;
  register:(payload:{name:string;email:string;password:string;password_confirmation:string})=>Promise<void>;
  logout:()=>Promise<void>;
  logoutAll:()=>Promise<void>;
  updateProfile:(payload:{name:string;email:string})=>Promise<User>;
  changePassword:(payload:{current_password:string;password:string;password_confirmation:string})=>Promise<void>;
};
const AuthContext=createContext<AuthContextValue|null>(null);
const TOKEN_KEY='gridwise-token';
const USER_KEY='gridwise-user';

export function getToken(){return localStorage.getItem(TOKEN_KEY)??sessionStorage.getItem(TOKEN_KEY);}
function saveSession(token:string,user:User,remember:boolean){const storage=remember?localStorage:sessionStorage;storage.setItem(TOKEN_KEY,token);storage.setItem(USER_KEY,JSON.stringify(user));}
function persistUser(user:User){
  if(localStorage.getItem(TOKEN_KEY)){localStorage.setItem(USER_KEY,JSON.stringify(user));return;}
  if(sessionStorage.getItem(TOKEN_KEY)){sessionStorage.setItem(USER_KEY,JSON.stringify(user));}
}
function clearSession(){localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(USER_KEY);sessionStorage.removeItem(TOKEN_KEY);sessionStorage.removeItem(USER_KEY);}

export function AuthProvider({children}:PropsWithChildren){
  const [user,setUser]=useState<User|null>(()=>{try{return JSON.parse(localStorage.getItem(USER_KEY)??sessionStorage.getItem(USER_KEY)??'null')}catch{return null}});
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    const token=getToken();
    if(!token){
      setLoading(false);
      return;
    }
    authApi.me().then(setUser).catch(()=>clearSession()).finally(()=>setLoading(false));
  },[]);

  const value=useMemo<AuthContextValue>(()=>({
    user,
    loading,
    login:async(username,password,remember)=>{
      const response=await authApi.login({username,password,remember});
      saveSession(response.token,response.user,remember);
      setUser(response.user);
    },
    register:async(payload)=>{
      const response=await authApi.register(payload);
      saveSession(response.token,response.user,true);
      setUser(response.user);
    },
    logout:async()=>{
      try{await authApi.logout();}
      finally{clearSession();setUser(null);}
    },
    logoutAll:async()=>{
      try{await authApi.logoutAll();}
      finally{clearSession();setUser(null);}
    },
    updateProfile:async(payload)=>{
      const updated=await authApi.updateProfile(payload);
      if(user){
        const nextUser={...user,...updated};
        persistUser(nextUser);
        setUser(nextUser);
        return nextUser;
      }
      setUser(updated);
      return updated;
    },
    changePassword:async(payload)=>{
      await authApi.changePassword(payload);
      if(user){
        persistUser(user);
      }
    },
  }),[user,loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){const context=useContext(AuthContext);if(!context)throw new Error('useAuth must be used within AuthProvider');return context;}
