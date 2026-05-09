# Stage 1 - build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy solution + all projects
COPY . .

# restore solution (important: root level .sln)
RUN dotnet restore Optrixa.sln

# publish ONLY API project
RUN dotnet publish src/Optrixa.API/Optrixa.API.csproj -c Release -o /app/publish

# Stage 2 - runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "Optrixa.API.dll"]