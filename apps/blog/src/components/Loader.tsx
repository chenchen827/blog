import { Spin } from 'antd'

/** 居中加载态 */
export default function Loader() {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <Spin size="large" />
    </div>
  )
}
