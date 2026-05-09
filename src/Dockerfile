FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy ONLY backend source (src)
COPY . .

# Restore using PROJECT FILE (NOT .sln)
RUN dotnet restore src/Optrixa.API/Optrixa.API.csproj

# Publish API
RUN dotnet publish src/Optrixa.API/Optrixa.API.csproj -c Release -o /publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /publish .

ENTRYPOINT ["dotnet", "Optrixa.API.dll"]