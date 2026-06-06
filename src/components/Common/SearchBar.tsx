import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ placeholder = '搜索...', value, onChange }: SearchBarProps) {
  return (
    <Input
      placeholder={placeholder}
      prefix={<SearchOutlined />}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: 280 }}
    />
  );
}
