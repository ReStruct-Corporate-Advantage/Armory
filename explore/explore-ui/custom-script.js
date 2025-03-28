const fs = require("fs");

// Exclude file names to ignore
const excludeFileNames = ['main', 'polyfills', 'common', 'runtime'];

// Read the names of all the JavaScript files in the ./dist/explore-ui directory
fs.readdir("./dist/explore-ui", (err, files) => {
  if (err) {
    console.error(err);
    return;
  }

  // Filter out non-JavaScript files
  const jsFiles = files.filter(file => file.endsWith(".js"))
                       .filter((fileName) => !excludeFileNames.some(ex => fileName.includes(ex)));


  // Read the contents of the preload-js.html file
  fs.readFile("./dist/explore-ui/preload-js.html", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    // Insert the JavaScript files as script tags in the preload-js.html file
    const scriptTags = jsFiles.map(jsFile => `<script src="${jsFile}"></script>`).join("\n");
    const newData = data.replace(/<script[^>]*>.*?<\/script>/g, scriptTags);

    // Write the updated preload-js.html file
    fs.writeFile("./dist/explore-ui/preload-js.html", newData, "utf8", err => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("The JavaScript files were added to preload-js.html");
    });
  });
});
