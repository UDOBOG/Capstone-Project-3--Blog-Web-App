import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

let blogs = [];

app.get("/", (req, res) => {
    const { title, content, error } = req.query;

    res.render("index.ejs", {
        blogs,
        blogToEdit: null,
        error,
        title,
        content
    });
});

app.get("/contact", (req, res) => {
    res.render("contact.ejs");
});

app.post("/submit-blog", (req, res) => {
    const { title, content } = req.body;
    const slug = title.toLowerCase().replace(/\s+/g, "-");
    const slugExists = blogs.find(b => slug === b.slug);
    if (slugExists) {
        res.redirect("/?error=" + encodeURIComponent("A blog with the same or similar name already exists. Please choose a different title.") +
            "&title=" + encodeURIComponent(title) +
            "&content=" + encodeURIComponent(content));
    } else {
        blogs.push({ title, content, slug });
        blogs.sort((a, b) => (a.title).localeCompare(b.title));
        res.redirect("/");
    }
});

app.get("/:slug", (req, res) => {
    const blog = blogs.find(b => req.params.slug === b.slug);
    if (blog) {
        res.render("blog-post.ejs", { blog });
    } else {
        res.status(404).send("Blog not found.");
    }
});

app.get("/:slug/edit", (req, res) => {
    const blog = blogs.find(b => b.slug === req.params.slug);
    if (blog) {
        res.render("index.ejs", {
            blogs,
            blogToEdit: blog
        });
    } else {
        res.status(404).send("Blog not found.");
    }
});

app.post("/:slug/edit", (req, res) => {
    const content = req.body.content;
    const blog = blogs.find(b => b.slug === req.params.slug);
    if (!blog) {
        res.status(404).send("Blog not found.");
    } else {
        blog.content = content;
        res.redirect("/");
    }
});

app.post("/:slug/delete", (req, res) => {
    const blog = blogs.find(b => b.slug === req.params.slug);
    const ind = blogs.indexOf(blog);
    blogs.splice(ind, 1);
    res.redirect("/");
});

app.listen(port, (req, res) => {
    console.log(`Listening on port ${port}`);
});