import React from "react";
import { connect } from "react-redux";
import Spotify from "spotify-web-api-js";
import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { List, Tooltip, IconButton, Snackbar } from "@material-ui/core";
import NotInterestedIcon from "@material-ui/icons/NotInterested";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import ListItemText from "@material-ui/core/ListItemText";
import MuiAlert from "@material-ui/lab/Alert";

const styles = (theme) => ({
  link: {
    color: theme.palette.secondary.main,
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
});

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const spotifyWebApi = new Spotify();

class TinderifyPlaylist extends React.Component {
  state = {
    followList: [],
    tracks: [],
    errorSnackOpen: false,
    deleteSnackOpen: false,
  };
  componentDidMount = () => {
    spotifyWebApi
      .getPlaylistTracks(this.props.mySpotPlaylists.TinderifyPlaylistID)
      .then(
        (data) => {
          console.log("Songs in playlist", data);
          this.setState({
            tracks: data.items,
          });
        },
        function (err) {
          console.error(err);
        }
      );
  };

  removeSongFromMySpotPlayList = (id) => {
    spotifyWebApi
      .removeTracksFromPlaylist(
        this.props.mySpotPlaylists.TinderifyPlaylistID,
        ["spotify:track:" + id]
      )
      .then((res) => {
        this.setState({
          deleteSnackOpen: true,
        });
        spotifyWebApi
          .getPlaylistTracks(this.props.mySpotPlaylists.TinderifyPlaylistID)
          .then(
            (data) => {
              console.log("Songs in playlist", data);
              this.setState({
                tracks: data.items,
              });
            },
            function (err) {
              console.error(err);
            }
          );
      })
      .catch((err) => {
        this.setState({
          errorSnackOpen: true,
        });
        console.log("error adding song to Tinderify playlist: ", err);
      });
  };

  handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    this.setState({
      errorSnackOpen: false,
      deleteSnackOpen: false,
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <div>
        <h1>{this.state.name}</h1>
        <h4>{this.state.description}</h4>
        <Container maxWidth="lg">
          <List className={classes.listRoot} dense={true}>
            {this.state.tracks.map((track, index) => {
              return (
                <ListItem key={index}>
                  <Tooltip title="Delete from Tinderify playlist">
                    <IconButton
                      aria-label="delete"
                      onClick={() =>
                        this.removeSongFromMySpotPlayList(track.track.id)
                      }
                    >
                      <NotInterestedIcon className="unfavorite" />
                    </IconButton>
                  </Tooltip>
                  <ListItemAvatar>
                    <Avatar
                      variant="square"
                      src={
                        track.track.album.images.length
                          ? track.track.album.images[
                              track.track.album.images.length - 1
                            ].url
                          : null
                      }
                    ></Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    classes={{ primary: classes.listItemText }}
                    primary={track.track.name}
                    secondary={track.track.album.artists.map(
                      (artist, index) =>
                        artist.name +
                        (index < track.track.album.artists.length - 1
                          ? " | "
                          : "")
                    )}
                  />
                </ListItem>
              );
            })}
          </List>
        </Container>
        <Snackbar
          open={this.state.deleteSnackOpen}
          autoHideDuration={6000}
          onClose={() => this.handleClose()}
        >
          <Alert onClose={() => this.handleClose()} severity="success">
            Song deleted from Tinderify playlist!
          </Alert>
        </Snackbar>
        <Snackbar
          open={this.state.errorSnackOpen}
          autoHideDuration={6000}
          onClose={() => this.handleClose()}
        >
          <Alert onClose={() => this.handleClose()} severity="error">
            Error adding or deleting song to Tinderify playlist.
          </Alert>
        </Snackbar>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  mySpotPlaylists: state.mySpotPlaylists,
  spotifyApi: state.spotifyApi,
});

export default connect(mapStateToProps)(withStyles(styles)(TinderifyPlaylist));
