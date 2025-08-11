export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change_me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
  aws: { region: process.env.AWS_REGION ?? 'ap-northeast-2' },
  dynamo: { table: process.env.DYNAMO_TABLE ?? 'DeviceRegistry' },
  admin: {
    allowedCidrs: (process.env.ALLOWED_ADMIN_CIDRS ?? '0.0.0.0/0').split(',').map((x) => x.trim()),
  },
  sqs: {
    createOnApprove: (process.env.CREATE_QUEUE_ON_APPROVE ?? 'true') === 'true',
    queuePrefix: process.env.SQS_QUEUE_PREFIX ?? 'device-reg-',
  },
});