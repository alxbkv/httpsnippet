ClientResource cr = new ClientResource("http://mockbin.com/har");
ChallengeResponse credentials = new ChallengeResponse(ChallengeScheme.HTTP_BASIC);
        credentials
                .setRawValue("NGQ5Yjc1MWMtYTk3MC00ZmUxLTllNjgtYWRiY2RlOTNmYmI2OjA2NmRkY2M4LTMxODgtNDRjYS1hYjk2LWY1ZGJlZWNhNTAxMw==");
        cr.setChallengeResponse(credentials);
try {
    Representation representation = cr
            .post(new StringRepresentation(
                    "{\"number\":1,\"string\":\"f\\\"oo\",\"arr\":[1,2,3],\"nested\":{\"a\":\"b\"},\"arr_mix\":[1,\"a\",{\"arr_mix_nested\":{}}],\"boolean\":false}",
                    MediaType.APPLICATION_JSON));
    System.out.println(representation.getText());
} catch (ResourceException e) {
    System.err.println("Status: " + e.getStatus() + ". Response: " + cr.getResponse().getEntityAsText());
}
