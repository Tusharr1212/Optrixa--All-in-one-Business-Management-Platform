# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and all projects
COPY . .

# Restore solution (IMPORTANT)
RUN dotnet restore Optrixa.sln

# Build & publish API only
RUN dotnet publish src/Optrixa.API/Optrixa.API.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "Optrixa.API.dll"]