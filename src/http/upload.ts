import path from "path";
import { createReadStream, unlink } from "fs";
import { RequestHandler } from "express";
import { HTTP } from "../type.js";

export const uploadf: HTTP<RequestHandler> = (drive, folderID) => {
    return {
        route: "/upload",
        f: async (req, res) => {
            try {
                const response = await drive.files.create({
                    requestBody: {
                        name: path.basename(req.body.filename),
                        mimeType: req.body.mimetype,
                        parents: [folderID ?? ""]
                    },
                    media: {
                        mimeType: req.body.mimetype,
                        body: createReadStream(req.body.filename),
                    },
                    fields: "webViewLink,webContentLink,name,id",
                });
                await drive.permissions.create({
                    fileId: response.data.id!,
                    requestBody: {
                        role: 'reader',
                        type: 'anyone',
                    }
                });
                unlink(req.body.filename, console.error);
                res.send({
                    name: response.data.name,
                    view: response.data.webViewLink,
                    content: response.data.webContentLink,
                    id: response.data.id
                })
            } catch (err) {
                res.send(err)
            }
        }
    }
}