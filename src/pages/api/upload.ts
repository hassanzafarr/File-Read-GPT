import multer from 'multer';
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
const upload = multer({ dest: 'uploads/' });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest | any,
  res: NextApiResponse | any
) {
  if (req.method === 'POST') {
    upload.single('file')(req, res, (err: any) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        const { filename, originalname, mimetype } = req.file;
        const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
        fs.renameSync(req.file.path, filePath);
        res.status(200).json({ filename, originalname, mimetype });
        // const { filename, originalname, mimetype } = req.file;
        // res.status(200).json({ filename });
        console.log(req.file, 'FILENAME')
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
  }
}
