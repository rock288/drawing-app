import classNames from "classnames"
import { PropsWithChildren } from "react"

interface Props extends PropsWithChildren {
  className?: string
  onClick?: () => void
}

function Button(props: Props) {
  const { children, className, ...rest } = props
  return (
    <button
      className={classNames(
        "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full",
        {
          [className || ""]: !!className,
        }
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
