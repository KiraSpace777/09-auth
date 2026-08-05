// ==========================================================
// Pagination (ReactPaginate) + npm install
// ==========================================================
// npm install react-icons react-paginate && npm install -D @types/react-paginate
// ----------------------------------------

"use client";

import { useState, useEffect, useCallback, ComponentType } from "react";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import * as ReactPaginateModule from "react-paginate";
import type { ReactPaginateProps } from "react-paginate";
import css from "./Pagination.module.css";

const ReactPaginate = (ReactPaginateModule.default ||
  ReactPaginateModule) as ComponentType<ReactPaginateProps>;

interface PaginationProps {
  pageCount: number;
  currentPage: number;
  onPageChange: (selectedPage: number) => void;
}

// ==========================================================================
// Глобальні константи
// ==========================================================================
const VISIBLE_PAGES_COUNT = 5;

const leftArrow = <AiOutlineLeft size={16} />;
const rightArrow = <AiOutlineRight size={16} />;

export default function Pagination({ pageCount, currentPage, onPageChange }: PaginationProps) {
  const [isLeftPressed, setIsLeftPressed] = useState<boolean>(false);
  const [isRightPressed, setIsRightPressed] = useState<boolean>(false);

  const removeFocus = (): void => {
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handlePrevClick = useCallback((): void => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
      removeFocus();
    }
  }, [currentPage, onPageChange]);

  const handleNextClick = useCallback((): void => {
    if (currentPage < pageCount) {
      onPageChange(currentPage + 1);
      removeFocus();
    }
  }, [currentPage, pageCount, onPageChange]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const activeElement = document.activeElement;
      if (activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA") {
        return;
      }
      if (event.key === "ArrowLeft" && currentPage > 1) {
        setIsLeftPressed(true);
        handlePrevClick();
      }
      if (event.key === "ArrowRight" && currentPage < pageCount) {
        setIsRightPressed(true);
        handleNextClick();
      }
    };

    const handleKeyUp = (event: KeyboardEvent): void => {
      if (event.key === "ArrowLeft") setIsLeftPressed(false);
      if (event.key === "ArrowRight") setIsRightPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [currentPage, pageCount, handlePrevClick, handleNextClick]);

  const handlePageClick = (selectedItem: { selected: number }): void => {
    onPageChange(selectedItem.selected + 1);
    setTimeout(removeFocus, 0);
  };

  // ==========================================================================
  // ОПТИМІЗОВАНИЙ РОЗРАХУНОК ДІАПАЗОНУ СТОРІНОК ДЛЯ ПАГІНАЦІЇ
  // ==========================================================================
  const getPaginationItems = (): (number | string)[] => {
    // Якщо загальна кількість сторінок менша за ліміт, просто виводимо їх усі підряд
    if (pageCount <= VISIBLE_PAGES_COUNT) {
      return Array.from({ length: pageCount }, (_, index) => index + 1);
    }

    // Обчислюємо динамічний зсув вікна пагінації, щоб поточна сторінка завжди прагнула до центру
    let startPage = Math.max(1, currentPage - Math.floor((VISIBLE_PAGES_COUNT - 2) / 2));

    // Коригуємо краї, щоб вікно не виходило за межі доступних сторінок
    if (startPage + VISIBLE_PAGES_COUNT - 2 > pageCount) {
      startPage = pageCount - VISIBLE_PAGES_COUNT + 2;
    }

    // Будуємо базовий цифровий ряд
    const items: (number | string)[] = Array.from(
      { length: VISIBLE_PAGES_COUNT - 1 },
      (_, index) => startPage + index,
    );

    // Оскільки елементів має бути рівно 5 (або VISIBLE_PAGES_COUNT),
    // ми замінюємо останній елемент перед фіналом на три крапки, якщо попереду є хвіст сторінок
    if (Number(items[items.length - 1]) < pageCount) {
      items[items.length - 1] = "...";
    }

    return [...items];
  };

  const paginationItems = getPaginationItems();

  return (
    <div className={css.paginationWrapper} onMouseDown={removeFocus} onClick={removeFocus}>
      {/* БІБЛІОТЕКА: ReactPaginate */}
      <div className={css.hiddenLibrary}>
        <ReactPaginate
          breakLabel="..."
          nextLabel={rightArrow}
          previousLabel={leftArrow}
          onPageChange={handlePageClick}
          pageCount={pageCount}
          forcePage={currentPage - 1}
          pageRangeDisplayed={1}
          marginPagesDisplayed={1}
          containerClassName={css.pagination}
        />
      </div>

      {/* ul - ІНТЕРФЕЙС ДЛЯ ПАГІНАЦІЇ та СТРІЛОК */}
      <ul className={css.pagination}>
        {/* Стрілка ЛІВОРУЧ */}
        <li
          className={`${currentPage === 1 ? css.disabledPage : ""} ${isLeftPressed ? css.arrowPressed : ""}`}
          onClick={handlePrevClick}
        >
          <a href="#" onClick={(event) => event.preventDefault()}>
            {leftArrow}
          </a>
        </li>

        {/* ЦИФРОВИЙ РЯДОК ПАГІНАЦІЇ (НУМЕРАЦІЯ СТОРІНОК) */}
        {paginationItems.map((item, index) => {
          const isBreak = item === "...";
          const isActive = item === currentPage;

          return (
            <li
              key={index}
              className={`${isActive ? css.active : ""} ${isBreak ? css.disabledPage : ""}`}
              onClick={() => !isBreak && onPageChange(item as number)}
            >
              <a href="#" onClick={(event) => event.preventDefault()}>
                {item}
              </a>
            </li>
          );
        })}

        {/* Стрілка ПРАВОРУЧ */}
        <li
          className={`${currentPage === pageCount ? css.disabledPage : ""} ${isRightPressed ? css.arrowPressed : ""}`}
          onClick={handleNextClick}
        >
          <a href="#" onClick={(event) => event.preventDefault()}>
            {rightArrow}
          </a>
        </li>
      </ul>
    </div>
  );
}

// ===============================================================================
// специфіка імпорту react-paginate для REACT, але не працює для Next.JS
// --------------------------------------------------
// import type { ComponentType } from "react";
// import ReactPaginateModule from "react-paginate";
// import type { ReactPaginateProps } from "react-paginate";
// type ModuleWithDefault<T> = { default: T };
// ----------------------
// Розпаковуємо дефолтний експорт react-paginate для стабільної сумісності з Vite
// const ReactPaginate = (
//   ReactPaginateModule as unknown as ModuleWithDefault<ComponentType<ReactPaginateProps>>
// ).default;
// --------------------------------------------------
