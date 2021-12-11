import {Switch} from 'react-router-dom'
import Main from 'layouts/Main'
import RouteWithLayout from 'components/shared/RouteWithLayout'

import Home from 'pages/Home'

const AppRouter = ({connection}) => (
    <Switch>
        <RouteWithLayout layout={Main} exact path="/" component={Home} connection={connection} />
    </Switch>
)

export default AppRouter
