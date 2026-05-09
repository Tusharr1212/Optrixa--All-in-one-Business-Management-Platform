FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy everything
COPY . .

# Restore ONLY API project (critical fix)
RUN dotnet restore src/Optrixa.API/Optrixa.API.csproj

# Build + publish API
RUN dotnet publish src/Optrixa.API/Optrixa.API.csproj -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "Optrixa.API.dll"]