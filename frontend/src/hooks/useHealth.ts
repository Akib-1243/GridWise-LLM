import{useQuery}from'@tanstack/react-query';import{health}from'../api/health';export const useHealth=()=>useQuery({queryKey:['health'],queryFn:health,retry:1,staleTime:30000});
