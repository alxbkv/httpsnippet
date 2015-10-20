import org.restlet.resource.*;
ClientResource cr = new ClientResource("http://mockbin.com/har");
cr.accept(MediaType.APPLICATION_JSON);
Series<Header> headers = cr.getHeaders();
headers.set("x-foo", "Bar");
try {
    Representation representation = cr.get();
    System.out.println(representation.getText());
} catch (ResourceException e) {
    System.err.println("Status: " + e.getStatus() + ". Response: " + cr.getResponse().getEntityAsText());
}
