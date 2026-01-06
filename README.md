Replay API

##  
Upload replay: POST /save-replay with raw .hbr2 bytes in the body; response { "id": "<32-hex>", "url": "/replays/<id>.hbr2" }
##
Sample upload: curl -X POST https://replay.hax.ma/save-replay --data-binary @match.hbr2.
##
Share link: concatenate the host with the returned url; the same host serves downloads at /replays/<id>.hbr2.
##
Stats JSON: poll GET /stats/<id>.json (same host) once the websocket parser finishes; returns the full metrics document the web app consumes.
##
Typical integration flow: upload replay → keep the id → share /replays/<id>.hbr2 immediately → poll /stats/<id>.json until HTTP 200.