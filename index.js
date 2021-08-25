const axios = require("axios").default;
const ffmpegGif = require("fluent-ffmpeg");
const ffmpeg = require("ffmpeg");
const path = require("path");
const fs = require("fs");
const tf = require("@tensorflow/tfjs-node");
const nsfw = require("nsfwjs");

/// NSFW JS = FROM PATH
// async function imageFromPath() {
//   let input = path.join(__dirname, "/images/porn.jpeg");
//   const model = await nsfw.load(); // To load a local model, nsfw.load('file://./path/to/model/')
//   //   // Image must be in tf.tensor3d format
//   // you can convert image to tf.tensor3d with tf.node.decodeImage(Uint8Array,channels)
//   const convertToUint8ArrayFromPath = fs.readFileSync(input);
//   const image = await tf.node.decodeImage(convertToUint8ArrayFromPath);
//   const predictions = await model.classify(image);
//   image.dispose(); // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
//   console.log(predictions);
// }
// imageFromPath();

/// NSFW JS = FROM URL
// async function imageFromUrl() {
//   const pic = await axios.get(
//     `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXqb5WXeXN3sAfLyFex7js7PhV8sutGtDa0Ax8983FFajp_HmwhAFratuRwhpb06NOOiY&usqp=CAU`,
//     {responseType: "arraybuffer"}
//   );
//   const model = await nsfw.load(); // To load a local model, nsfw.load('file://./path/to/model/')
//   // Image must be in tf.tensor3d format
//   // you can convert image to tf.tensor3d with tf.node.decodeImage(Uint8Array,channels)
//   const image = await tf.node.decodeImage(pic.data, 3);
//   const predictions = await model.classify(image);
//   image.dispose(); // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
//   for (i = 0; i < predictions.length; i++) {
//     console.log(predictions[i].className + " = " + (predictions[i].probability * 100));
//   }
// }
// imageFromUrl()

/// NSFW JS = VIDEO NSFW
async function videoNsfw() {
  try {
    let nl;
    let pl;
    let dl;
    let hl;
    let sl;
    let neutral = 0;
    let porn = 0;
    let drawing = 0;
    let hentai = 0;
    let sexy = 0;
    const model = await nsfw.load();
    const input = path.join(__dirname, "/videos/music.mp4");
    fs.mkdir("./chunked_frames", async () => {
      const output = path.join(__dirname, "/chunked_frames");console.log("Start");
      new ffmpeg(input).then((video) => {video.fnExtractFrameToJPG(output, { file_name: "frame-%d" }, async (err, files) => {
              if (err) {
                fs.rmSync(output, {recursive: true });
                console.log('ERROR OI : '+ err);
              }
              for (i = 0; i < files.length; i++) {
                console.log(i);
                console.log(files[i])
                const fileImage = fs.readFileSync(files[i]);
                const convertImage = await tf.node.decodeImage(fileImage);
                const result = await model.classify(convertImage);
                for (j = 0; j < result.length; j++) {
                  switch (result[j]["className"]) {
                    case "Neutral":
                      if (result[j]["probability"] > neutral) {
                        neutral = result[j]["probability"];
                        nl = files[i];
                      }
                      break;
                    case "Drawing":
                      if (result[j]["probability"] > drawing) {
                        drawing = result[j]["probability"];
                        dl = files[i];
                      }
                      break;
                    case "Sexy":
                      if (result[j]["probability"] > sexy) {
                        sexy = result[j]["probability"];
                        sl = files[i];
                      }
                      break;
                    case "Hentai":
                      if (result[j]["probability"] > hentai) {
                        hentai = result[j]["probability"];
                        hl = files[i];
                      }
                      break;
                    case "Porn":
                      if (result[j]["probability"] > porn) {
                        porn = result[j]["probability"];
                        pl = files[i];
                      }
                      break;
                  }
                }
                convertImage.dispose();
                fs.rmSync(files[i]);
              }
              console.log("Neutral : image " + nl + " Score : " + neutral);
              console.log("Drawing : image " + dl + " Score : " + drawing);
              console.log("Sexy : image " + sl + " Score : " + sexy);
              console.log("Hentai : image " + hl + " Score : " + hentai);
              console.log("Porn : image " + pl + " Score : " + porn);
              fs.rmSync(output, { recursive: true });
            }
          );
        }).catch((e) => console.log("ERROR : " + e));
    });
  } catch (e) {
    throw e;
  }
}
videoNsfw();
