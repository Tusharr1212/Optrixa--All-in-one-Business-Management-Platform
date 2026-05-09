FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy EVERYTHING (important)
COPY . .

# Debug (TEMP - remove later if you want)
RUN ls -R src

# Restore
RUN dotnet restore src/Optrixa.API/Optrixa.API.csproj

# Publish
RUN dotnet publish src/Optrixa.API/Optrixa.API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "Optrixa.API.dll"]