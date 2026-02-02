
export enum MediaType {
  Image = 1,
  PersonImage = 2,
  PosterImage = 3,
  Video = 4,
  BannerImage = 5
}

export interface Media {
    id: string;
    url: string;
    type: MediaType;
}

export interface CreateMediaRequest {
  url: string;
  type: MediaType;
}

export interface AttachMediaRequest {
  mediaId: string;
}

export interface CreateAndAttachMediaResponse {
  movieId: string;
}

export const mapMediaToGallery = (mediaArray: any[], type: MediaType) => {
    return mediaArray?.map((item: any) => ({
        id: item.id,
        url: item.url,
        type: type
    })) || [];
};