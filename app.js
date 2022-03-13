const Parser = require("rss-parser");
const parser = new Parser();

const SanitizeHtml = require("sanitize-html");

const Scratch = require("new-scratch3-api");

const postId = "301869";
const projectId = "658898212"

const encodingKey = require('./encodingKey.json');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    let session = await Scratch.UserSession.create();
    let cloud = await session.cloudSession(projectId);
    cloud.set("☁ cloud", 10)

    let feed = await parser.parseURL(`https://scratch.mit.edu/discuss/feeds/topic/${postId}/`);

    const comments = [];
  
    feed.items.forEach(item => {

        const author = item.author;
        const summary = SanitizeHtml(item.summary, {allowedTags: [], allowedAttributes: {}});
        comments.push({author: author, summary: summary});

    });

    const encodedComments = [];

    comments.forEach(comment => {
        const newComment = {}
        Object.keys(comment).forEach(key => {

            let string = "";
            for(let charId in comment[key]) {
                const num = encodingKey.findIndex(item=>item===comment[key][charId]) + 1;
                string += (num < 10 ? "0":"")+num;
            };

            newComment[key] = string;
        });
        encodedComments.push(newComment);
    });

    let encodedString = "";
    encodedComments.forEach(comment => {
        encodedString += comment.author + "00" + comment.summary;
        if (encodedComments.length -1 !== encodedComments.indexOf(comment)) {
            encodedString += "00";
        };
    });

    const splitString = encodedString.match(new RegExp('.{1,' + 254 + '}', 'g')); // fancy regex which i don't understand that splits it every 254 chars
    console.log(splitString.length)

    for(let string of splitString) {
        console.log("iteration")
        await cloud.set("☁ cloud", "19" + string);
        let cloudValue = "not20";
        while(cloudValue != "20") {
            await sleep(101);
            cloudValue = cloud.get("☁ cloud");
        };
        console.log("done!");
        await sleep(101);
    };
    await cloud.set("☁ cloud", "11");

})();