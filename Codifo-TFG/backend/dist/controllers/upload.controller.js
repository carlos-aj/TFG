"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImagen = uploadImagen;
function uploadImagen(req, res) {
    if (!req.files || !(req.files instanceof Array) || req.files.length === 0) {
        res.status(400).json({ message: 'No files uploaded' });
    }
    else {
        const filenames = req.files.map((file) => file.filename);
        res.json({ filenames });
    }
}
