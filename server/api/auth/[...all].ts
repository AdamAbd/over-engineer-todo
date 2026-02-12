import { fromWebHandler } from 'h3'
import { auth } from '../../lib/auth'

export default fromWebHandler(auth.handler)
