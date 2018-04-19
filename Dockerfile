FROM nginx
ADD dist/* /server/static
CMD ["nginx", "-g", "daemon off;"]