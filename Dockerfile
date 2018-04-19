FROM nginx
COPY static/ /server/static
RUN ["ls" "/server/static"]
CMD ["nginx", "-g", "daemon off;"]