# Image Uploader
Standalone service for uploading and automatically resizing images.

## Configuration
Create a config JSON file e.g. by copying the `config/config.sample.json` file.

| Property | Default | Valid values |
|---       |---      |---           |
| `logLevel` | `warn` | `silly`, `debug`, `verbose`, `info`, `warn`, `error` |
| `storage` | disk: `uploads` directory in project root | See below |
| `database` | in-memory | See below |
| `imageSizes` | | Array of `{ name: string, width: number, height: number }` where width and height are pixel values to resize the image to. |

### Storage
**Disk**: The images will be uploaded to a directory on the server. This directory must have write permissions for the server process.

| Property | Valid values |
|---       |---           |
| `type` | `disk` |
| `path` | Full absolute path to a writable directory on the server. If the directory does not exist it will be created. |


**AWS**: The images will be uploaded to the given S3 bucket.

| Property | Valid values |
|---       |---           |
| `type` | `aws` |
| `bucketName` | Name of a bucket in the region configured in `awsSettingsFile`  |
| `awsSettingsFile` | Full path to an [AWS credentials file](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-json-file.html). |

### Database
**In-Memory**: Items are stored in memory. Everything will be lost on shutdown.

| Property | Valid values |
|---       |---           |
| `type` | `memory` |


**File**: Data is stored in a file on the filesystem.

| Property | Valid values |
|---       |---           |
| `type` | `file` |
| `path` | Full path to a file. This will be overwritten. |


**MongoDB**: Data is stored in a MongoDB instance.

| Property | Valid values |
|---       |---           |
| `type` | `mongodb` |
| `url` | [MongoDB connection string](https://docs.mongodb.com/manual/reference/connection-string/) including the database path |


### Image Sizes

Images uploaded to the server can be fetched in a variety of sizes, configured here.
Names and sizes provided will allow downloading the image at `/:imageId/:size` in the given size.

Images will be resized at the first time they are requested in a given size.
