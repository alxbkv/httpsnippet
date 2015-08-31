import org.restlet.resource.*;
ClientResource cr = new ClientResource("http://mockbin.com/har");
try {
    Representation representation = cr.get();
    System.out.println(representation.getText());
} catch (ResourceException e) {
    System.err.println("Status: " + e.getStatus() + ". Response: " + cr.getResponse().getEntityAsText());
}
