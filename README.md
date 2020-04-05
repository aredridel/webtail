# webtail

## Use:

```
for async (const buf of webtail('http://example.org')) {
   // do something with buf
}
```

The HTTP requests will include the `Range` header, open-ended from where it
left off.

The HTTP requests will include the `Prefer` header ([Prefer: wait=time](https://tools.ietf.org/html/rfc7240#section-4.1)), indicating that it can long poll.

See also [HTTP Ranges and live requests](https://www.rfc-editor.org/rfc/rfc8673.html#name-establishing-the-randomly-a), [prior art on indeterminiate length ranges](https://tools.ietf.org/html/draft-combs-http-indeterminate-range-02)



If the `ETag` changes while tailing, an exception will be thrown indicating
the need to restart.

Changes will be streamed.
