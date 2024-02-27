import db from "./db";

const getError = (error: any) => {
  console.log('Get Error: ', error.toString())
  error.response && error.response.data && error.response.data.message ?
    error.response.data.message :
    error.message;

  return error;
}

const onError = async (err: any, req: any, res: any, next: any) => {
  console.log('On Error: ', err.toString())
  await db.disconnect();
  res.status(500).send({ message: err.toString() });
};

export { getError, onError };