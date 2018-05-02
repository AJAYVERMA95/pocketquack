var express = require("express");
var router = express.Router();
var multer = require("multer");
var ps = require("child_process");
var storage = multer.diskStorage({
    destination: "uploads",
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

var upload = multer({
    storage
});

/* GET home page. */
router.get("/", (req, res) => {
    res.status(200).json({
        message: "hitting the server"
    });
});
router.post("/upload/file", upload.single("fileName"), function(req, res, next) {
    const fileName = req.file.originalname;
    // console.log(fileName);

    const ch = ps.spawnSync(
        "source ~/tensorflow/bin/activate && python -m scripts.label_image --graph=tf_files/retrained_graph.pb --image=/home/aj_verma/Documents/project/poketquack/uploads/" + fileName,
        {
            shell: "/bin/bash",
            cwd: "/home/aj_verma/Documents/project/poketquack/tensorFlowScripts"
        }
    );
    let tfData = ch.stdout
        .toString()
        .split("\n")
        .filter(val => {
            return val;
        });
    let data = {};
    // console.log(tfData);
    tfData.shift();
    tfData.forEach(v => {
        const dataArr = v.split(" ");
        const key = dataArr[0];
        const val = dataArr[1];
        data[key] = val;
    });
    // console.log(data);

    res.status(200).json({
        data: {
            melanoma: data["melanomainfected"],
            chickenpox: data["chickenpoxinfected"],
            diabetes: data["retinainfected"]
        }
    });
    // res.end();
});

module.exports = router;
