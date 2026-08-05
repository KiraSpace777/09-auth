// ==========================================================
// SearchBox
// ==========================================================
//
import css from "./SearchBox.module.css";

interface SearchBoxProps {
  onSearchChange: (text: string) => void;
  // Додано пропс value для того, щоб зробити інпут контрольованим за вимогою ментора
  value: string;
}

export default function SearchBox({ onSearchChange, value }: SearchBoxProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onSearchChange(event.target.value);
  };

  return (
    <input
      type="text"
      value={value} // інпут відображає актуальний стан пошуку
      onChange={handleChange}
      className={css.input}
      placeholder="Search notes"
      // autoFocus
    />
  );
}
