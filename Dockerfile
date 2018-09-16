FROM nginx
COPY dist/ /server/static
CMD ["nginx", "-g", "daemon off;"]
