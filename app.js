//creating server and serving html and css files
//both index.html and style.css files must be placed in another folder "public"
import { readFile } from "fs/promises";
import {createServer} from "http";
import path from "path";

const PORT = 3000;

const serveFile = async (res, filePath, contentType) => {
     try{
                const data = await readFile(filePath);
                 res.writeHead(200,{'Content-Type': contentType});
                 res.end(data);
            }catch(error){
                res.writeHead(404,{'Content-Type':"content/plain"});
                res.end("404 page not found")
            }
}

const server = createServer((req,res)=> {
    console.log(req.url)
    if(req.method === "GET"){
        if(req.url === "/"){
           return serveFile(res, path.join("public","index.html"),   "text/html");
          

}
    }else if(req.method === "GET"){
        if(req.url === "style.css"){
           return serveFile(
            res,
            path.join("public","style.css"),   "text/css")
          

        }
    }

})

server.listen(PORT,()=>{
    console.log(`server running at http://localhost:${PORT}`)
});
