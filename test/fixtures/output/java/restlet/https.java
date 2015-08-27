ClientResource cr = new ClientResource("https://mockbin.com/har");
try {
    Representation representation = cr.get();
    System.out.println(representation.getText());
} catch (ResourceException e) {
    System.err.println("Status: " + e.getStatus() + ". Response: " + cr.getResponse().getEntityAsText());
}
