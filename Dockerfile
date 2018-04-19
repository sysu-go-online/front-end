FROM nginx
COPY dist/* /server/static/
RUN ["ls" "/server/static"]
CMD ["nginx", "-g", "daemon off;"]