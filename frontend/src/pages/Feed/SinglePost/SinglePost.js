// import React, { Component } from 'react';

// import Image from '../../../components/Image/Image';
// import './SinglePost.css';

// class SinglePost extends Component {
//   state = {
//     title: '',
//     author: '',
//     date: '',
//     image: '',
//     content: ''
//   };

//   componentWillMount() {
//     const postId = this.props.match.params.postId;
//     fetch(`http://localhost:3002/post/single-post/${postId}`)
//       .then(res => {
//         console.log('res', res);
//         if (res.status !== 200) {
//           throw new Error('Failed to fetch status');
//         }
//         return res.json();
//       })
//       .then(resData => {
//         console.log('resData', resData);
//         this.setState({
//           title: resData.title,
//           author: resData.creator.name,
//           date: new Date(resData.createdAt).toLocaleDateString('en-US'),
//           content: resData.content
//         });
//         console.log('state', this.state);
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   render() {
//   //  console.log(this.state);
//     return (
//       <section className="single-post">
//         <h1>{this.state.title}</h1>
//         <h2>
//           Created by {this.state.author} on {this.state.date}
//         </h2>
//         <div className="single-post__image">
//           <Image contain imageUrl={this.state.image} />
//         </div>
//         <p>{this.state.content}</p>
//       </section>
//     );
//   }
// }

// export default SinglePost;

import React, { Component } from 'react';

import Image from '../../../components/Image/Image';
import './SinglePost.css';

class SinglePost extends Component {
  state = {
    title: 'this is the first post',
    author: 'Prateek',
    date: '',
    image: '',
    content: 'this is the test post for unit'
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;
    fetch('http://localhost:3002/post/single-post/' + postId)
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch status');
        }
        return res.json();
      })
      .then(resData => {
        console.log('json resData', resData);
        this.setState( (state, props) => {
          return {
            title: resData.post.title,
            author: resData.post.author,
            image: 'http://localhost:3002/' + resData.post.imageUrl,
            date: new Date(resData.post.createdAt).toLocaleDateString('en-US'),
            content: resData.post.content
          }
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;