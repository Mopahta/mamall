# Mamall Online Communications

Web application for performing online audio conversations. Supports calls in private and in rooms with multiple users.

![Mamall logo.](/images/logo.png "Mamall logo.")

### Features

* User System
* Authorization via JWT
* Pending contacts invitations
* Private calls
* Room calls

## Architecture

Application consists of multiple services.

![Mamall architecture.](/images/schema.png "Mamall architecture.")

## WebRTC

Application uses WebRTC specification implemented by 3rd party library Mediasoup.

## Run

Files with environment variables must be written before run.

`.db_env`:

```
POSTGRES_DB=
POSTGRES_SCHEMA=
POSTGRES_PASSWORD=
POSTGRES_USER=
PGHOST=172.16.239.11
```

`.backend_env`:

[Choosing Mediasoup variables](https://mediasoup.org/faq/#running-mediasoup-in-hosts-with-private-ip)
```
MEDIASOUP_LISTEN=
MEDIASOUP_ANNOUNCED_IP= 
CORSORIGIN= 
JWTSECRET= secret sequence used to generate jwt token
```

`.frontend_env`:
```
HTTPHOST= api endpoint [http://url:8080/api/v1]
WSHOST= websocket endpoint [ws://url:7001]
```

After all files are initialized as preferred run:
```
docker compose up
```