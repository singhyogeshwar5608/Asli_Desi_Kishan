<?php

namespace App\Http\Requests\EventMedia;

use Illuminate\Foundation\Http\FormRequest;

class EventMediaIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'ADMIN';
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'media_type' => $this->input('mediaType', $this->input('media_type')),
            'is_active' => $this->input('status'),
            'sort' => $this->input('sort', $this->input('order')),
            'search' => $this->input('search', $this->input('query')),
        ]);
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'media_type' => ['nullable', 'in:IMAGE,VIDEO,image,video'],
            'is_active' => ['nullable', 'in:active,inactive,1,0,true,false'],
            'sort' => ['nullable', 'in:recent,oldest,title_asc,title_desc,manual'],
            'status' => ['nullable', 'in:active,inactive'],
            'page' => ['nullable', 'integer', 'min:1'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }

    public function validated($key = null, $default = null)
    {
        $data = parent::validated($key, $default);
        if (isset($data['media_type'])) {
            $data['media_type'] = strtoupper($data['media_type']);
        }

        if (isset($data['is_active'])) {
            $data['is_active'] = in_array($data['is_active'], ['active', '1', 1, true, 'true'], true);
        }

        $data['limit'] = $data['limit'] ?? 12;
        $data['page'] = $data['page'] ?? 1;
        $data['sort'] = $data['sort'] ?? 'manual';

        return $data;
    }
}
