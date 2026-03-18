<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EventMediaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
  
    {
    
        return [
            'id' => $this->id,
            'title' => $this->title,
            'caption' => $this->caption,
            'description' => $this->description,
            'altText' => $this->alt_text,
            'mediaType' => $this->media_type,
            'fileUrl' => $this->file_url,
            'thumbnailUrl' => $this->thumbnail_url,
            'mimeType' => $this->mime_type,
            'fileSizeBytes' => $this->file_size_bytes,
            'durationSeconds' => $this->duration_seconds,
            'isActive' => (bool) $this->is_active,
            'sortOrder' => $this->sort_order,
            'meta' => $this->meta,
            'uploadedAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
