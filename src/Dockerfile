FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# COPY FULL REPO (critical fix)
COPY . .

# Restore using solution (now it WILL exist)
RUN dotnet restore Optrixa.sln

# Publish ONLY API project
RUN dotnet publish src/Optrixa.API/Optrixa.API.csproj -c Release -o /publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /publish .

ENTRYPOINT ["dotnet", "Optrixa.API.dll"]