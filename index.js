import { Configuration, OpenAIApi } from "openai";
import readline from "readline";
import express from "express"
import http from 'http';
import ejs from 'ejs';
import bodyParser from 'body-parser';
import showdown from 'showdown';
import hljs from 'highlight.js';

const app = express()
const server = http.createServer(app)
const converter = new showdown.Converter();
const userInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});



/* ============ ROUTES ============ */
app.set("view engine", "ejs"); // Setting View Engine to ejs (/views)
app.use(express.static('public'));
app.get("/", function (req, res) {
  res.render("index",{first:"Hello World"});
});

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.post("/test",(request,response)=>{
  const {fname, lname} = request.body
  console.log(fname)
  response.render('index',{first:fname})
})

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.post("/chat", async (request, response) => {
  const { question } = request.body;
  const { api_key } = request.body;
  const configuration = new Configuration({
    apiKey: api_key,
  });
  const openai = new OpenAIApi(configuration);
  const result = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a EbereGPT. You can help with graphic design tasks",
      },
      {
        role: "user", 
        content: question
      },
    ],
  });
  const markdownText = result.data.choices[0].message.content; // The Markdown text from the request body
  const html = converter.makeHtml(markdownText);
  
  console.log(html)
  
  response.render('chat', {answer:html})
});


app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.post("/ajax-request", async (request, response) => {
  // GET DATA
// GET DATA
  const { question, api_key } = request.body;

  try {
    // API
    const configuration = new Configuration({
      apiKey: api_key,
    });
    const openai = new OpenAIApi(configuration);

    const result = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a EbereGPT. You can help with graphic design tasks",
        },
        {
          role: "user", 
          content: question
        },
      ],
    });
    const markdownText = result.data.choices[0].message.content; // The Markdown text from the request body
    const html = converter.makeHtml(markdownText);
    
    //console.log(html)
    
    response.render('ajax_result', {answer:html, question:question})
  } catch (error) {
    console.log(error)
    response.render('ajax_result', {answer:error.message})
  }
});


server.listen(5099, () => {
  console.log('listening on *:5099');
});

/* ====================================================== */

/* TEST CONSOLE */
userInterface.prompt();
userInterface.on("line", async (input) => {
  await openai
    .createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: input }],
    })
    .then((res) => {
      console.log(res.data.choices[0].message.content);
      userInterface.prompt();
    })
    .catch((e) => {
      console.log(e);
    });
});


