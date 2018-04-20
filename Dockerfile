FROM nginx
COPY static/ /server/static
CMD ["nginx", "-g", "daemon off;"]