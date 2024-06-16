import Downshift from "downshift"
import { RefObject, useCallback, useRef, useState, useEffect } from "react"
import classNames from "classnames"
import { DropdownPosition, InputSelectOnChange, InputSelectProps } from "./types"


type GetDropdownPositionFn = (element: RefObject<HTMLDivElement>) => DropdownPosition;

export function InputSelect<TItem>({
  label,
  defaultValue,
  onChange: consumerOnChange,
  items,
  parseItem,
  isLoading,
  loadingLabel,
}: InputSelectProps<TItem>) {
  
  const inputRef = useRef<HTMLDivElement>(null)
  const [selectedValue, setSelectedValue] = useState<TItem | null>(defaultValue ?? null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
  })

  const onChange = useCallback<InputSelectOnChange<TItem>>(
    (selectedItem) => {
      if (selectedItem === null) {
        return
      }

      consumerOnChange(selectedItem)
      setSelectedValue(selectedItem)
    },
    [consumerOnChange]
  )

  useEffect(() => {

    const handleScroll = () => {
      if (isDropdownOpen) {
        setDropdownPosition(getDropdownPosition(inputRef));
      }
    }
    window.addEventListener('scroll', handleScroll);
    return () => {
      //window.remo
    }
  }, [isDropdownOpen])


  return (
    <Downshift<TItem>
      id="RampSelect"
      onChange={onChange}
      selectedItem={selectedValue}
      itemToString={(item) => (item ? parseItem(item).label : "")}
    >
      {({
        getItemProps,
        getLabelProps,
        getMenuProps,
        isOpen,
        highlightedIndex,
        selectedItem,
        getToggleButtonProps,
        inputValue,
      }) => {
        const toggleProps = getToggleButtonProps()
        const parsedSelectedItem = selectedItem === null ? null : parseItem(selectedItem)

        return (
          <div className="RampInputSelect--root">
            <label className="RampText--s RampText--hushed" {...getLabelProps()}>
              {label}
            </label>
            <div className="RampBreak--xs" />
            <div
              className="RampInputSelect--input"
              ref={inputRef}
              onClick={(event) => {
                setDropdownPosition(getDropdownPosition(inputRef))
                toggleProps.onClick(event)
              }}
            >
              {inputValue}
            </div>

            <div
              className={classNames("RampInputSelect--dropdown-container", {
                "RampInputSelect--dropdown-container-opened": isOpen,
              })}
              {...getMenuProps()}
              style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
            >
              {renderItems()}
            </div>
          </div>
        )

        function renderItems() {
          if (!isOpen) {
            setIsDropdownOpen(false)
            return null
          } else {
            setIsDropdownOpen(true)
          }

          if (isLoading) {
            return <div className="RampInputSelect--dropdown-item">{loadingLabel}...</div>
          }

          if (items.length === 0) {
            return <div className="RampInputSelect--dropdown-item">No items</div>
          }

          return items.map((item, index) => {
            const parsedItem = parseItem(item)
            return (
              <div
                key={parsedItem.value}
                {...getItemProps({
                  key: parsedItem.value,
                  index,
                  item,
                  className: classNames("RampInputSelect--dropdown-item", {
                    "RampInputSelect--dropdown-item-highlighted": highlightedIndex === index,
                    "RampInputSelect--dropdown-item-selected":
                      parsedSelectedItem?.value === parsedItem.value,
                  }),
                })}
              >
                {parsedItem.label}
              </div>
            )
          })
        }
      }}
    </Downshift>
  )
}

const getDropdownPosition: GetDropdownPositionFn = (element: RefObject<HTMLDivElement>) => {
  let element_current = element.current;
  if (element_current instanceof HTMLDivElement) {
    const { top, left, height } = element_current.getBoundingClientRect()
    //const { scrollY } = window
    return {
      top: top + height,
      left,
    }
  }

  return { top: 0, left: 0 }
}
