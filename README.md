# webtail

## Use

```javascript
for async (const buf of webtail('http://example.org')) {
   // do something with buf
}
```

The HTTP requests will include the `Prefer` header with the `follow` parameter,
to indicate that, if the connection is over HTTP/2, it will accept pushes of
the next segments, and wishes to receive information about the next segments.

Changes will be streamed.

Static resources can be downloaded in chunks, with the prefer headers ignored.

Streams can be appended to resources as bytes, and additional segments are
linked with the link header with "next" relations.

## Protocol design

The protocol is designed to replace websockets in a way compatible with HTTP/2,
and for some use cases, able to leverage caching and content distribution
networks.  stream is a series of requests. Over HTTP/1.1, the client is
responsible for long polling such that it can receive updates in a timely
manner. Over HTTP/2, pushes are sent, each stream allocating the push stream
for the nest response, allowing the server to shorten the round-trip time by
not waiting for the requestor to initiate.

Bidirectional streams are associations at the application layer between GET and
PUT streams.

### Sequence for receiving a byte stream

```http2
:method=GET
:path=/file
range=bytes=0-
prefer=wait=30, follow
```

```http2
:status=200
content-range=bytes 0-65535/*

[data]
```

After the data is sent but before the stream is closed, a push is returned as well:

```http2
:method=GET
:path=/file
range=bytes=65536-
prefer=wait=30, follow

:status=200
content-range=65535-131070/^

[data]
```

The HTTP requests will include the `Range` header, open-ended from where it
left off.

The HTTP requests will include the `Prefer` header ([Prefer:
wait=time](https://tools.ietf.org/html/rfc7240#section-4.1)), indicating that
it can long poll.

See also [HTTP Ranges and live
requests](https://www.rfc-editor.org/rfc/rfc8673.html#name-establishing-the-randomly-a),
[prior art on indeterminiate length
ranges](https://tools.ietf.org/html/draft-combs-http-indeterminate-range-02)

### Sequence for receiving a message stream

```http2
:method=GET
:path=/file
prefer=wait=30, follow
```

```http2
:status=200
link=</file?seq=2>; rel=next

[data]
```

After the data is sent but before the stream is closed, a push is returned as well:

```http2
:method=GET
:path=/file?seq=2
prefer=wait=30, follow=this

:status=200
link</file?seq=3>; rel=next

[data]
```
