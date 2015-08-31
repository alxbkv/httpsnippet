import org.restlet.resource.*;
ClientResource cr = new ClientResource("http://mockbin.com/har");
cr.getCookies().add(new Cookie("foo", "bar"));
cr.getCookies().add(new Cookie("bar", "baz"));
try {
    Representation representation = cr.post(null);
    System.out.println(representation.getText());
} catch (ResourceException e) {
    System.err.println("Status: " + e.getStatus() + ". Response: " + cr.getResponse().getEntityAsText());
}
