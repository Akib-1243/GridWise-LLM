import{useMutation}from'@tanstack/react-query';import{optimize}from'../api/optimize';export const useOptimize=()=>useMutation({mutationFn:optimize});
