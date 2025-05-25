//creating server and serving html and css files
//both index.html and style.css files must be placed in another folder "public"
// a folder named "data" should be created first to save logs
import { readFile } from "fs/promises";
import {createServer} from "http";
import crypto from "crypto";
import path from "path";
import { writeFile } from "fs/promises";

const PORT = 3000;
const DATA_FILE = path.join("data", 'links.json');

const serveFile = async (res, filePath, contentType) => {
     try{
                const data = await readFile(filePath);
                 res.writeHead(200,{'Content-Type': contentType});
                 res.end(data);
            }catch(error){
                res.writeHead(404,{'Content-Type':"text/plain"});
                res.end("404 page not found")
            }
}

const loadLinks = async () => {
    try{
      const data = await readFile(DATA_FILE, "utf-8");
      return JSON.parse(data);


    }catch(error){
        if(error.code === "ENOENT"){
            await writeFile(DATA_FILE, JSON.stringify({}));
            return {};
        }
        throw error;
    }
}

const saveLinks = async (links)=>{
    await writeFile(DATA_FILE, JSON.stringify(links, null, 2))
}
const server = createServer(async (req,res)=> {
    console.log(req.url)
    if(req.method === "GET"){
        if(req.url === "/"){
           return serveFile(res, path.join("public","index.html"),   "text/html");
          

}

        else if(req.url === "/style.css"){
           return serveFile(
            res,
            path.join("public","style.css"),   "text/css")
          

        }else if(req.url === "/links"){
            const links = await loadLinks();
            res.writeHead(200,{"Content-Type":"application/json"});
            return res.end(JSON.stringify(links));

        }else{
            const links = await loadLinks();
            const shortCode = req.url.slice(1);
            console.log("link redirect", req.url);
            if(links[shortCode]){
                res.writeHead(302,{location : links[shortCode]});
                return res.end()
            }
                res.writeHead(404,{"Content-Type" : "text/plain"});
                return res.end("url not found")
        }
    }

    if(req.method === "POST" && req.url === "/shorten"){

        const links = await loadLinks();
        let  body ="";
        req.on("data",(chunk)=> body += chunk

        )
        req.on('end',async () =>{
            console.log(body);
            const {url,shortCode} = JSON.parse(body)

            if(!url){
                res.writeHead(404,{"Content-Type":"text/plain"});
                return res.end("URL IS REQUIRED")
            }


            const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");
            if(links[finalShortCode]){
                res.writeHead(404,{"Content-Type":"text/plain"})
               return res.end("short code already exists give another one") 
            }

            links[finalShortCode] = url;



            await saveLinks(links);
            res.writeHead(200,{"Content-Type":"plain/text"});
            res.end(JSON.stringify({success:true, shortCode:finalShortCode}));
        })
    }

    }

);

server.listen(PORT,()=>{
    console.log(`server running at http://localhost:${PORT}`)
});
